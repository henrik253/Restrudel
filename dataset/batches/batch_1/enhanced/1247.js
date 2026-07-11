setcpm(110/4)

$: s("bd ~ hh ~").bank("RolandTR808").gain(.82)

$: s("~ sd ~ sd").bank("RolandTR808").gain(.5)

$: note("d4 ~ ~ c4 ~ e4").s("piano")
  .lpf(2500).release(.3).room(.3).gain(.4)

$: note("<d2 d2 c2 e2>").s("sawtooth")
  .lpf(700).release(.2).gain(.5)

$: note("<d5 f5 a5 g5>").s("triangle")
  .lpf(3000).release(.3).delay(.4).gain(.3)
