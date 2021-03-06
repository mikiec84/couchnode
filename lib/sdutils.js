function sdSplitPath(path) {
    if (!path) {
        return [];
    }

    // TODO: Improve this parsing substantially.
    var identifier = '';
    var parts = [];
    for (var i = 0; i < path.length; ++i) {
        if (path[i] === '[') {
            // Starting an array, use the previous bit as a property
            if (identifier) {
                parts.push({path: identifier, type: 'property'});
                identifier = '';
            }
        } else if (path[i] === ']') {
            // array path of identifier;
            parts.push({path: parseInt(identifier), type: 'index'});
            identifier = '';
            // skip the `.` that follows, if there is one
            ++i;
        } else if (path[i] === '.') {
            parts.push({path: identifier, type: 'property'});
            identifier = '';
        } else {
            identifier += path[i];
        }
    }
    if (identifier) {
        parts.push({path: identifier, type: 'property'});
    }
    return parts;
}
module.exports.splitPath = sdSplitPath;

function _sdInsertByPath(root, parts, value) {
    if (parts.length === 0) {
        return value;
    }

    var firstPart = parts.shift();
    if (firstPart.type === 'property') {
        if (!root) {
            root = {};
        }
        if (Array.isArray(root)) {
            throw new Error('expected object, found array');
        }
        
        root[firstPart.path] = _sdInsertByPath(root[firstPart.path], parts, value);
    } else if (firstPart.type === 'index') {
        if (!root) {
            root = [];
        }
        if (!Array.isArray(root)) {
            throw new Error('expected array, found object');
        }
        
        root[firstPart.path] = _sdInsertByPath(root[firstPart.path], parts, value);
    } else {
        throw new Error('encountered unexpected path type');
    }

    return root;
}

function sdInsertByPath(root, path, value) {
    var parts = sdSplitPath(path);
    return _sdInsertByPath(root, parts, value);
}
module.exports.sdInsertByPath = sdInsertByPath;