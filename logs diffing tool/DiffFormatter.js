var SourceDiff = SourceDiff || {};

SourceDiff.DiffFormatter = function(diff) {
    var formattedDiff = function(originalText, editedText) {
        var results = diff.diff(originalText, editedText);

        var lines = lineUpText(originalText, editedText, results);

        var originalLines = lines[0];
        var editedLines = lines[1];

        findModifiedLines(originalLines, editedLines, results);

        var lineDiffs = diffModifiedLines(originalLines, editedLines, results);

        var lineFormatter = SourceDiff.LineFormatter(results, lineDiffs);

        var deletedText = lineFormatter.formatLeftText(originalLines);
        var addedText = lineFormatter.formatRightText(editedLines);

        return [deletedText, addedText, lineFormatter.getEditIterator()];
    };

    var lineUpText = function(originalText, editedText, results) {
        var originalLines = SourceDiff.split(originalText);
        var editedLines = SourceDiff.split(editedText);

        SourceDiff.padBlankLines(originalLines);
        SourceDiff.padBlankLines(editedLines);

        results.paddingLeft = new SourceDiff.EditSet();
        results.paddingRight = new SourceDiff.EditSet();

        for (var i = 0; i < Math.max(originalLines.length, editedLines.length); i++) {
            if (!results.deleted.contains(i) && results.added.contains(i)) {
                originalLines.splice(i, 0, ' ');
                results.deleted.updateNumbers(i);
                results.paddingLeft.add(i);
            } else if (results.deleted.contains(i) && !results.added.contains(i)) {
                editedLines.splice(i, 0, ' ');
                results.added.updateNumbers(i);
                results.paddingRight.add(i);
            }
        }

        return [originalLines, editedLines];
    };

    var findModifiedLines = function(originalLines, editedLines, results) {
        results.modifiedRight = new SourceDiff.EditSet();
        results.modifiedLeft = new SourceDiff.EditSet();
        for (var i = 0; i < originalLines.length && i < editedLines.length; i++) {
            if (results.added.contains(i) && results.deleted.contains(i)) {
                results.modifiedLeft.add(i);
                results.modifiedRight.add(i);
            } else if (results.added.contains(i) && results.modifiedRight.contains(i - 1)) {
                results.modifiedRight.add(i);
            } else if (results.deleted.contains(i) && results.modifiedLeft.contains(i - 1)) {
                results.modifiedLeft.add(i);
            }
        }
    };

    var diffModifiedLines = function(originalLines, editedLines, results) {
        var lineDiffs = new SourceDiff.EditSet();

        for (var i = 0; i < originalLines.length && i < editedLines.length; i++) {
            if (results.modifiedLeft.contains(i) || results.modifiedRight.contains(i)) {
                var lineDiff = diff.lineDiff(originalLines[i], editedLines[i]);
                lineDiff.cleanUp();

                lineDiffs.addValue(i, lineDiff);
            }
        }

        return lineDiffs;
    };

    return {
        lineUpText: lineUpText, //exposed for testing
        formattedDiff: formattedDiff
    };
};