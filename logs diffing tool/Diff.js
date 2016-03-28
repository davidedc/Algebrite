var SourceDiff = SourceDiff || {};

SourceDiff.Diff = function(ignoreLeadingWS) {
    var trimTrailingWhiteSpace = function(str) {
        if (str) {
            return str.trimRight();
        }
        return str;
    };

    var checkTrimLeadingWhiteSpace = function(str) {
        if (str && ignoreLeadingWS) {
            return str.trimLeft();
        }
        return str;
    };

    var trimWhiteSpace = function(str) {
        if (!str) return str;

        if (ignoreLeadingWS) {
            return str.trim();
        } else {
            return str.trimRight();
        }
    };

    var lineDiff = function(originalLine, editedLine) {
        var originalTrimmed = checkTrimLeadingWhiteSpace(originalLine);
        var editedTrimmed = checkTrimLeadingWhiteSpace(editedLine);

        var originalOffset = originalLine.length - originalTrimmed.length;
        var editOffset = editedLine.length - editedTrimmed.length;

        originalTrimmed = trimTrailingWhiteSpace(originalTrimmed);
        editedTrimmed = trimTrailingWhiteSpace(editedTrimmed);

        var matrix = createMatrix(0, originalTrimmed, editedTrimmed);

        fillMatrix(0, originalTrimmed, editedTrimmed, matrix);

        return createLineDiff(originalTrimmed, editedTrimmed, originalOffset, editOffset, matrix);
    };

    var createLineDiff = function (originalTrimmed, editedTrimmed, originalOffset, editOffset, matrix) {
        var diff = new SourceDiff.LineDiff();

        var i = originalTrimmed.length;
        var j = editedTrimmed.length;

        while (i >= 0 && j >= 0) {
            if (originalTrimmed[i - 1] === editedTrimmed[j - 1]) {
                if (originalTrimmed[i - 1]) {
                    diff.addCommon(originalOffset + i - 1, editOffset + j - 1);
                }
                i--;
                j--;
            } else if (j >= 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
                if (editedTrimmed[j - 1].length > 0) {
                    diff.addInsert(editOffset + j - 1);
                }
                j--;
            } else if (i >= 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
                if (originalTrimmed[i - 1].length > 0) {
                    diff.addDelete(originalOffset + i - 1);
                }
                i--;
            }
        }

        return diff;
    };

    var diff = function(originalText, editedText) {
        var originalLines = SourceDiff.split(originalText);
        var editedLines = SourceDiff.split(editedText);

        SourceDiff.padBlankLines(originalLines);
        SourceDiff.padBlankLines(editedLines);

        var startPos = trimCommonLines(originalLines, editedLines);

        var matrix = createMatrix(startPos, originalLines, editedLines);

        fillMatrix(startPos, originalLines, editedLines, matrix);

        var results = findAddsAndDeletes(originalLines, editedLines, startPos, matrix);

        checkShiftEdits(SourceDiff.split(originalText), results.deleted);
        checkShiftEdits(SourceDiff.split(editedText), results.added);

        return results;
    };

    var findAddsAndDeletes = function (originalLines, editedLines, startPos, matrix) {
        var i = originalLines.length;
        var j = editedLines.length;

        var added = new SourceDiff.EditSet();
        var deleted = new SourceDiff.EditSet();

        var allAddsOrDeletes = checkAllAddsOrDeletes(originalLines, editedLines, added)
            || checkAllAddsOrDeletes(editedLines, originalLines, deleted);

        if (!allAddsOrDeletes) {
            while (i >= startPos && j >= startPos) {
                var m = i - startPos;
                var n = j - startPos;
                if (m > 0 && n > 0 && linesAreEqual(originalLines[i - 1], editedLines[j - 1])) {
                    i--;
                    j--;
                } else if (j >= startPos && (i === startPos || matrix[m][n - 1] >= matrix[m - 1][n])) {
                    if (j - 1 >= startPos && editedLines[j - 1].length > 0) {
                        added.add(j - 1);
                    }
                    j--;
                } else if (i >= startPos && (j === startPos || matrix[m][n - 1] < matrix[m - 1][n])) {
                    if (i - 1 >= startPos && originalLines[i - 1].length > 0) {
                        deleted.add(i - 1);
                    }
                    i--;
                }
            }
        }

        return {added: added, deleted: deleted};
    };

    var checkAllAddsOrDeletes = function(lines, otherLines, editSet) {
        if (lines.length === 1 && lines[0] === '') {
            for (var i = 0; i < otherLines.length; i++) {
                editSet.add(i);
            }
            return true;
        }
        return false;
    };

    var linesAreEqual = function(line1, line2) {
        return trimWhiteSpace(line1) === trimWhiteSpace(line2);
    };

    //Find all continuous runs of inserts or deletes. For each run, see if it can be shifted forward 1 line.
    //This is useful for properly pairing opening and closing braces in C-like languages, for example.
    var checkShiftEdits = function(textLines, editSet) {
        var editArray = editSet.all();
        if (editArray.length > 0) {
            var startRun = editArray[0];

            var current = startRun;
            for (var i = 1; i < editArray.length; i++) {
                if (i === editArray.length - 1) {   //end of the run and the edits
                    if (editArray[i] === current + 1) {
                        current++;
                    }
                    checkShiftRun(textLines, editSet, startRun, current);
                } else if (editArray[i] === current + 1) {
                    current++;
                } else {    //end of the run
                    checkShiftRun(textLines, editSet, startRun, current);

                    startRun = current = editArray[i];
                }
            }
        }
    };

    var checkShiftRun = function(textLines, editSet, startRun, endRun) {
        if (linesAreEqual(textLines[startRun], textLines[endRun + 1]) && lineIsBlank(textLines[startRun + 1])) {
            editSet.remove(startRun);
            editSet.add(endRun + 1);
        }
    };

    var lineIsBlank = function(line) {
        return /^\s*$/.test(line);
    };

    var createMatrix = function(startPos, originalLines, editedLines) {
        var matrix = [];
        for (var i = 0; i <= originalLines.length - startPos; i++) {
            matrix[i] = new Array(editedLines.length - startPos + 1);
            matrix[i][0] = 0;
        }

        for (var j = 1; j <= editedLines.length - startPos; j++) {
            matrix[0][j] = 0;
        }

        return matrix;
    };

    var fillMatrix = function(startPos, originalLines, editedLines, matrix) {
        for (var i = 1; i <= originalLines.length - startPos; i++) {
            var originalTrimmed = trimWhiteSpace(originalLines[i + startPos - 1]);
            for (var j = 1; j <= editedLines.length - startPos; j++) {
                var trimmedEdit = trimWhiteSpace(editedLines[j + startPos - 1]);
                if (originalTrimmed === trimmedEdit) {
                    matrix[i][j] = matrix[i - 1][j - 1] + 1;
                } else {
                    matrix[i][j] = Math.max(matrix[i][j - 1], matrix[i - 1][j]);
                }
            }
        }
    };

    var trimCommonLines = function(originalLines, editedLines) {
        var linesRemaining = function(startPos) {
            return originalLines.length > startPos && editedLines.length > startPos
        };

        var startPos = 0;

        while (linesRemaining(startPos) && linesAreEqual(originalLines[startPos], editedLines[startPos])) {
            startPos++;
        }

        while (linesRemaining(startPos) && linesAreEqual(originalLines[originalLines.length - 1], editedLines[editedLines.length - 1])) {
            originalLines.pop();
            editedLines.pop();
        }

        return startPos;
    };

    return {
        diff: diff,
        trimCommonLines: trimCommonLines,   //exposed for testing
        lineDiff: lineDiff
    };
};