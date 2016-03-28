var SourceDiff = SourceDiff || {};

SourceDiff.AnchorIterator = function(anchors) {
    var allAnchors = anchors.all();
    var currentIndex = 0;

    var getNextEdit = function () {
        if (currentIndex + 1 < allAnchors.length) {
            currentIndex++;
            return allAnchors[currentIndex];
        }
        return false;
    };

    var getPrevEdit = function () {
        if (currentIndex - 1 >= 0) {
            currentIndex--;
            return allAnchors[currentIndex];
        }
        return false;
    };

    return {
        getNextEdit: getNextEdit,
        getPrevEdit: getPrevEdit
    };
};