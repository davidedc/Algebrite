# export BAZEL_VERSION=3.0.0
# curl -fLO "https://github.com/bazelbuild/bazel/releases/download/${BAZEL_VERSION}/bazel-${BAZEL_VERSION}-installer-darwin-x86_64.sh"
# chmod +x "bazel-${BAZEL_VERSION}-installer-darwin-x86_64.sh"
# ./bazel-${BAZEL_VERSION}-installer-darwin-x86_64.sh --user
# export PATH="$PATH:$HOME/bin"
# tsc --esModuleInterop --downlevelIteration -t es5 run-micro-tests.ts
# tsc --esModuleInterop --downlevelIteration -t es5 index.ts

cat tests-from-master/*.coffee | coffee -cbs > all-tests-from-master.js
cat all-tests-from-master.js run-tests-from-master.js | node 
