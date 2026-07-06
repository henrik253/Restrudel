setcpm(118/4)

$: s("bd ~ ~ cp").bank("Linn9000").gain(.85)

$: s("hh*2 hh cp").gain(.2)

$: s("~ sleighbells ~ sleighbells").gain(.2).pan("0.2 -0.2")

$: n("<0 3 5 7>").scale("g:minor").s("ocarina")
  .lpf(2500).hpf(500).room(.6).release(.2).gain(.35)

$: n("<g1 g1 eb1 f1>").scale("g:minor").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
