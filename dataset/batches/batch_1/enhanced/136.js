setcpm(108/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ ~ cr ~").bank("RolandTR808").gain(.4)

$: s("hh*8").gain("[.2 .13]*4").pan(.5)

$: note("e3 a3 c4 e4 a4 e4 f2").s("gm_harmonica")
  .clip(1).gain("0.2 0.4 0.3 0.5").room(.5).release(.2)

$: note("<a1 e2 c2 e2>").s("sawtooth").lpf(600).release(.25).gain(.5)
