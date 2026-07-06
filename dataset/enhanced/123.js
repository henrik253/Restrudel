setcpm(122/4)

$: s("bd ~ bd ~").bank("RolandTR808").gain(.9)

$: s("~ sd ~ sd").bank("RolandTR808").gain(.6)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: note("c1 f1 c1 f1").s("sawtooth").lpf(600).release(.2).gain(.5)

$: n("0 3 7 5").scale("c:minor").s("saw")
  .lpf(2000).resonance(6).release(.15).delay(.3).gain(.4)
