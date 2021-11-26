# export BAZEL_VERSION=3.0.0
# curl -fLO "https://github.com/bazelbuild/bazel/releases/download/${BAZEL_VERSION}/bazel-${BAZEL_VERSION}-installer-darwin-x86_64.sh"
# chmod +x "bazel-${BAZEL_VERSION}-installer-darwin-x86_64.sh"
# ./bazel-${BAZEL_VERSION}-installer-darwin-x86_64.sh --user
# export PATH="$PATH:$HOME/bin"

# Then
#   bazel build algebrite
#   bazel test :all
# if that doesn't work it's because there might be another bazel installation
# in which case you can find what's interfering by doing
#   which bazel
# and you can run these anyways to run the exact bazel you want:
#   $HOME/bin/bazel build algebrite
#   $HOME/bin/bazel test :all

# Also yo ucan build Algebrite without bazel:
#   tsc --esModuleInterop --downlevelIteration -t es5 run-micro-tests.ts
#   tsc --esModuleInterop --downlevelIteration -t es5 index.ts


cat tests-from-master/*.coffee | coffee -cbs > all-tests-from-master.js
cat all-tests-from-master.js run-tests-from-master.js | node 
