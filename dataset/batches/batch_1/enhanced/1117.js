setcpm(120/4)

$: s("bd ~ sd ~").bank("linn9000").gain(.85)

$: s("hh*8").gain(.18)

$: n("9*2 9!2 6").scale("g:dorian").s("gm_electric_bass_finger")
  .struct("x!4 ~ x x").lpf(700).release(.2).gain(.45)

$: note("d4 d#4").s("sawtooth").lpf(600).lpq(.2)
  .delay(.5).release(.2).gain(.35)
