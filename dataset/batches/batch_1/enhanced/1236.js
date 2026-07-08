setcpm(112/4)

$: s("bd ~ bd ~").bank("SequentialCircuitsDrumtracks").lpf(700).gain(.5)

$: s("~ sd ~ sd").bank("SequentialCircuitsDrumtracks").gain(.4)

$: note("a2 f2 c3 g2 a2 f2").s("woodblock:1")
  .lpf(2500).release(.3).room(.3).gain(.4)

$: note("c4 c4 a#3 c4").s("square")
  .lpf(700).release(.15).gain(.4)

$: note("<a1 f1 c2 g1>").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
