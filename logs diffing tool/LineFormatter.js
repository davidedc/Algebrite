var SourceDiff = SourceDiff || {};

SourceDiff.LineFormatter = function(results, lineDiffs) {
    var anchors = new SourceDiff.EditSet();

    var added = results.added.all();
    var deleted = results.deleted.all();

    var lineIsCommon = function(i) {
        return !results.added.contains(i) && !results.deleted.contains(i)
    };

    if (!lineIsCommon(0)) {
        anchors.add(0);
    }

    for (var i = 0; i < Math.max(Math.max.apply(null, added), Math.max.apply(null, deleted)); i++) {
        if (lineIsCommon(i) && !lineIsCommon(i + 1)) {
            anchors.add(i);
        }
    }

    var formatLeftText = function (text1Lines) {
        var deletedText = '';

        var startingPos = getStartingPos(results);
        var text1EndingPos = getEndingPos(results, text1Lines);

        for (var i = startingPos; i < text1EndingPos; i++) {
            if (anchors.contains(i)) {
                deletedText += '<a name="' + i + '"></a>';
            }
            if (lineDiffs.contains(i) && results.modifiedLeft.contains(i)) {
                var lineDiff = lineDiffs.get(i);
                deletedText += appendModifiedLine(text1Lines[i], lineDiff.deleted);
            } else {
                var className = getClassNameLeft(results, i);
                deletedText += appendLine(className, text1Lines[i]);
            }
        }

        return deletedText;
    };

    var formatRightText = function (text2Lines) {
        var addedText = '';

        var startingPos = getStartingPos(results);
        var text2EndingPos = getEndingPos(results, text2Lines);

        for (var i = startingPos; i < text2EndingPos; i++) {
            if (lineDiffs.contains(i) && results.modifiedRight.contains(i)) {
                var lineDiff = lineDiffs.get(i);
                addedText += appendModifiedLine(text2Lines[i], lineDiff.added);
            } else {
                var className = getClassNameRight(results, i);
                addedText += appendLine(className, text2Lines[i]);
            }
        }
        return addedText;
    };

    var appendModifiedLine = function(textLine, lineEdits) {
        var  formattedText = '<span class="modified">';
        var startIndex = 0;
        for (var j = 0; j < lineEdits.length; j++) {
            formattedText += escapeHtml(textLine.substring(startIndex, lineEdits[j].position));
            startIndex = lineEdits[j].endPosition + 1;
            formattedText += '<span class="modified-light">' + escapeHtml(textLine.substring(lineEdits[j].position, startIndex))
                + '</span>';
        }

        if (startIndex < textLine.length) {
            formattedText += escapeHtml(textLine.substring(startIndex, textLine.length));
        }

        formattedText += '</span><br>';

        return formattedText;
    };

    var getStartingPos = function(results) {
        var allDeletes = results.deleted.all();

        var firstDelete = allDeletes.length > 0
            ? allDeletes[0]
            : -1;

        var allAdds = results.added.all();

        var firstAdd = allAdds.length > 0
            ? allAdds[0]
            : -1;

        var firstEdit;
        if (firstDelete === -1) {
            firstEdit = firstAdd;
        } else if (firstAdd === -1) {
            firstEdit = firstDelete;
        } else {
            firstEdit = Math.min(firstDelete, firstAdd)
        }

        return Math.max(0, firstEdit - 10);
    };

    var getEndingPos = function(results, lines) {
        var allDeletes = results.deleted.all();

        var lastDelete = allDeletes.length > 0
            ? allDeletes[allDeletes.length - 1]
            : 0;

        var allAdds = results.added.all();

        var lastAdd = allAdds.length > 0
            ? allAdds[allAdds.length - 1]
            : 0;

        var lastEdit = Math.max(lastDelete, lastAdd);

        return Math.min(lines.length, lastEdit + 11);
    };

    var getClassNameLeft = function (results, i) {
        var className = '';
        if (results.modifiedLeft.contains(i)) {
            className = 'modified';
        } else if (results.paddingLeft.contains(i)) {
            className = 'padding';
        } else if (results.deleted.contains(i)) {
            className = 'deleted';
        }
        return className;
    };

    var getClassNameRight = function (results, i) {
        var className = '';
        if (results.modifiedRight.contains(i)) {
            className = 'modified';
        } else if (results.paddingRight.contains(i)) {
            className = 'padding';
        } else if (results.added.contains(i)) {
            className = 'inserted';
        }
        return className;
    };

    var appendLine = function(className, line) {
        var append = '';

        if (className != '') {
            append += '<span class="' + className + '">';
        }
        append += escapeHtml(line);
        if (className != '') {
            append += '</span>';
        }

        append += '<br>';

        return append;
    };

    var escapeHtml = function(string) {
        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };

        var replacedTabs = string.replace(/\t/g, '   ');

        return String(replacedTabs).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    };

    var getEditIterator = function() {
        return new SourceDiff.AnchorIterator(anchors);
    };

    return {
        formatLeftText: formatLeftText,
        formatRightText: formatRightText,
        getEditIterator: getEditIterator
    };
};