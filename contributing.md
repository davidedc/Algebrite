# Some points of interest / thoughts for contributors

## SMIB by Philippe Billet has several changes to EigenMath to be looked into.

Philippe Billet has forked EigenMath into his own CAS named [SMIB](http://smib.sourceforge.net/). SMIB keeps very similar structure and intent, and contains several changes that might be of interest.

## Use of Javascript-specific runtime features beyond what's already in use

There might be a good argument to avoid going all-in in Javascript-specific features (beyond what's already in use) quickly. I'm validating this argument at the moment, in the meantime please try to stick to the patterns already in use while staying away from, say, using inheritance or functional patterns.

## Use of web workers and timeout system

This is slightly contradicting with the point above, but might be worth it: Algebrite would highly benefit from using web workers. Both for the interactive sessions and for the tests, this would avoid "script not responsive" messages. Also Algebrite could be configured to throw timeout-errors on configurable durations. Note that node.js workers are slightly non-standard.

## Use of "deep/complex" frameworks

Deep/complex frameworks for building/testing/documentation/etc. are welcome but only if they can be compactly explained/used/tweaked/understood by non-experts in frameworks/tooling. Tooling of significant complexity can still live separately from this project and be used on-occasion by the interested parties only (say, special documentation generators, special tests).

## Tests

The current test system is hand-made, browser-based and a little involved. Some simplifications and optimisations (see "web workers" suggestion above) would be handy. Also, the more tests the merrier (possibly organised in "shallow/normal/deep" layers?).

## Examples, manuals

Algebrite skates a lot on SMIB's and EigenMath's references and manuals. Now if there is one good thing about the browser-based build is that the working system and the manual could be *together*.

## Draw functionality

It's not been ported over yet. 

## Multi-layered complexity

Ideally, we'd like a system that can be simply understood and extended: let's bring-in the most elaborate strategies and algorithms, but let's try to plug them in so that they can be understood separately as an extension to the "simple" parts.

