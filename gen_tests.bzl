load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_test")
def gen_tests(srcs):
  for src in srcs:
    name = src.replace("s/","_").replace(".ts","")
    nodejs_test(name=name, entry_point = src, data=[":tsc","@npm//big-integer"])