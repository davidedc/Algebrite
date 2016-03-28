var SourceDiff = SourceDiff || {};

SourceDiff.LineDiff = function() {
    var _added = [];
    var _deleted = [];
    var _common = [];

    var addCommon = function(leftPosition, rightPosition) {
        _common.unshift({
            leftPosition: leftPosition,
            leftEndPosition: leftPosition,
            rightPosition: rightPosition,
            rightEndPosition: rightPosition
        });
    };

    var addDelete = function(position) {
        _deleted.unshift({
            position: position,
            endPosition: position});
    };

    var addInsert = function(position) {
        _added.unshift({
            position: position,
            endPosition: position});
    };

    var editLength = function(edit) {
        if (!edit) {
            return 0;
        }
        return edit.endPosition - edit.position + 1;
    };

    var cleanUp = function() {
        mergeAdjacent(_added);
        mergeAdjacent(_deleted);
        mergeAdjacentCommon();

        do {
            var didMerge = false;
            for (var i = 0; i < _common.length; i++) {
                var equalityLength = _common[i].leftEndPosition - _common[i].leftPosition + 1;

                var leftDelete = findEditWithEndingPosition(_deleted, _common[i].leftPosition - 1);
                var rightDelete = findEditWithPosition(_deleted, _common[i].leftEndPosition + 1);

                var leftAdd = findEditWithEndingPosition(_added, _common[i].rightPosition - 1);
                var rightAdd = findEditWithPosition(_added, _common[i].rightEndPosition + 1);
                if (equalityLength <= 8 && editLength(leftDelete) + editLength(leftAdd) >= equalityLength
                        && editLength(rightDelete) + editLength(rightAdd) >= equalityLength) {
                    didMerge = true;
                    if (leftDelete && rightDelete) {
                        leftDelete.endPosition = rightDelete.endPosition;
                        removeEdit(_deleted, rightDelete);
                    } else if(leftDelete) {
                        leftDelete.endPosition = _common[i].leftEndPosition;
                    } else if (rightDelete) {
                        rightDelete.position = _common[i].leftPosition;
                    } else {
                        addEdit(_deleted, _common[i].leftPosition, _common[i].leftEndPosition);
                    }

                    if (leftAdd && rightAdd) {
                        leftAdd.endPosition = rightAdd.endPosition;
                        removeEdit(_added, rightAdd);
                    } else if (leftAdd) {
                        leftAdd.endPosition = _common[i].rightEndPosition;
                    } else if (rightAdd) {
                        rightAdd.position = _common[i].rightPosition;
                    } else {
                        addEdit(_added, _common[i].rightPosition, _common[i].rightEndPosition);
                    }

                    _common.splice(i, 1);
                }
            }
        } while (didMerge)
    };

    var mergeAdjacentCommon = function () {
        for (var i = 0; i < _common.length; i++) {
            if (i + 1 < _common.length
                    && _common[i].leftEndPosition + 1 === _common[i + 1].leftPosition
                    && _common[i].rightEndPosition + 1 === _common[i + 1].rightPosition) {
                _common[i].leftEndPosition = _common[i + 1].leftEndPosition;
                _common[i].rightEndPosition = _common[i + 1].rightEndPosition;
                _common.splice(i + 1, 1);
                i--;
            }
        }
    };

    var addEdit = function(edits, position, endPosition) {
        var newEdit = {
            position: position,
            endPosition: endPosition
        };

        if (edits.length === 0) {
            edits.push(newEdit);
        } else if (position < edits[0].position) {
            edits.unshift(newEdit);
        } else {
            for (var i = edits.length - 1; i >= 0; i--) {
                if (position > edits[i].position) {
                    edits.splice(i + 1, 0, newEdit);
                    break;
                }
            }
        }
    };

    var removeEdit = function(edits, item) {
        for (var i = 0; i < edits.length; i++) {
            if (edits[i] === item) {
                edits.splice(i, 1);
                break;
            }
        }
    };

    var findEditWithPosition = function(edits, pos) {
        for (var i = 0; i < edits.length; i++) {
            if (edits[i].position === pos) {
                return edits[i];
            }
        }
    };

    var findEditWithEndingPosition = function(edits, endPos) {
        for (var i = 0; i < edits.length; i++) {
            if (edits[i].endPosition === endPos) {
                return edits[i];
            }
        }
    };

    var mergeAdjacent = function (edits) {
        for (var i = 0; i < edits.length; i++) {
            if (i + 1 < edits.length && edits[i].endPosition + 1 === edits[i + 1].position) {
                edits[i].endPosition = edits[i + 1].endPosition;
                edits.splice(i + 1, 1);
                i--;
            }
        }
    };

    return {
        addDelete: addDelete,
        addInsert: addInsert,
        addCommon: addCommon,
        cleanUp: cleanUp,
        added: _added,
        deleted: _deleted,
        common: _common
    };
};