"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.alloc_tensor = void 0;
const tensor_1 = require("../sources/tensor");
const defs_1 = require("./defs");
function alloc_tensor(nelem) {
    const p = new defs_1.Tensor();
    for (let i = 0; i < nelem; i++) {
        p.tensor.elem[i] = defs_1.Constants.zero;
    }
    tensor_1.check_tensor_dimensions(p);
    return p;
}
exports.alloc_tensor = alloc_tensor;
