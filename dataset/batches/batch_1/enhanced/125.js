setcpm(112/4)

$: s("bd ~ sd ~").bank("SequentialCircuitsDrumtracks").gain(.85)

$: s("hh*8").gain("[.2 .14]*4").pan(.5)

$: note("c2 eb2 c2 eb2").s("sawtooth").pan(.5)
  .lpf(700).release(.2).gain(.5)

$: s("gm_pad_warm").note("c4 eb4 g4 bb4").decay(.19).sustain(1)
  .room(.7).release(.4).gain(.3)

$: n("<0 3 5 7>").scale("c:minor").s("square")
  .lpf(1800).release(.15).delay(.3).gain(.35)
