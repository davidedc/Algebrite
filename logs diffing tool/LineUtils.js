var SourceDiff = SourceDiff || {};

SourceDiff.padBlankLines = function(lines) {
    if (lines.length === 1 && lines[0] === '') {
        return;
    }

    for (var l = 0; l < lines.length; l++) {
        if (lines[l] === '') {
            lines[l] = ' ';
        }
    }
};

SourceDiff.split = function(string) {
    return string.split(/\r?\n/);
};