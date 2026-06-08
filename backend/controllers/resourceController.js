// STUGUIDE X - Resource Hub Controller
const Resource = require('../models/Resource');
const hybridDb = require('../config/hybridDb');
const { Trie } = require('../services/trie');

const normalize = (value) => String(value || '').trim().toLowerCase();

const matchesQuery = (resource, query) => {
  if (!query) return true;
  const needle = normalize(query);
  const haystack = [
    resource.title,
    resource.type,
    resource.category,
    ...(resource.tags || [])
  ].map(normalize).join(' ');
  return haystack.includes(needle);
};

const buildSearchSuggestions = (resources, query) => {
  if (!query) return [];
  const trie = new Trie();
  resources.forEach((resource) => {
    [resource.title, resource.category, ...(resource.tags || [])]
      .filter(Boolean)
      .forEach((term) => trie.insert(String(term)));
  });
  return trie.searchPrefix(query).map((item) => item.data?.name || item.term).slice(0, 8);
};

exports.getResources = async (req, res, next) => {
  try {
    const { q = '', category = 'All', type = 'All', bookmarked = 'false' } = req.query;
    let resources;

    if (hybridDb.isActive) {
      resources = hybridDb.find('resources');
    } else {
      resources = await Resource.find().sort('-createdAt').lean();
    }

    const filtered = resources.filter((resource) => {
      const categoryMatch = category === 'All' || resource.category === category;
      const typeMatch = type === 'All' || resource.type === type;
      const queryMatch = matchesQuery(resource, q);
      const bookmarkedMatch = bookmarked !== 'true'
        || (resource.bookmarkedBy || []).map(String).includes(String(req.user._id));
      return categoryMatch && typeMatch && queryMatch && bookmarkedMatch;
    });

    const categories = ['All', ...new Set(resources.map((resource) => resource.category).filter(Boolean))];
    const types = ['All', ...new Set(resources.map((resource) => resource.type).filter(Boolean))];

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
      meta: {
        categories,
        types,
        suggestions: buildSearchSuggestions(resources, q)
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createResource = async (req, res, next) => {
  try {
    const { title, type, category, url, tags = [] } = req.body;
    const payload = {
      title,
      type,
      category,
      url,
      tags: Array.isArray(tags) ? tags : String(tags).split(',').map((tag) => tag.trim()).filter(Boolean),
      bookmarkedBy: []
    };

    const resource = hybridDb.isActive
      ? hybridDb.insert('resources', payload)
      : await Resource.create(payload);

    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};

exports.toggleBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = String(req.user._id);
    let resource;

    if (hybridDb.isActive) {
      resource = hybridDb.findOne('resources', { _id: id });
      if (!resource) return res.status(404).json({ success: false, error: 'Resource not found' });

      const bookmarkedBy = (resource.bookmarkedBy || []).map(String);
      const nextBookmarks = bookmarkedBy.includes(userId)
        ? bookmarkedBy.filter((item) => item !== userId)
        : [...bookmarkedBy, userId];

      hybridDb.update('resources', { _id: id }, { bookmarkedBy: nextBookmarks });
      resource = hybridDb.findOne('resources', { _id: id });
    } else {
      resource = await Resource.findById(id);
      if (!resource) return res.status(404).json({ success: false, error: 'Resource not found' });

      const bookmarkedBy = resource.bookmarkedBy.map(String);
      resource.bookmarkedBy = bookmarkedBy.includes(userId)
        ? resource.bookmarkedBy.filter((item) => String(item) !== userId)
        : [...resource.bookmarkedBy, req.user._id];
      await resource.save();
    }

    res.status(200).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
};
