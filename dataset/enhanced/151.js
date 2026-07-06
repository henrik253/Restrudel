setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ cowbell ~ cowbell").bank("RolandTR808").gain(.4)

$: s("hh*8").gain(.16)

$: n("c2 c2 c2 c2").s("square").lpf(502).release(.2)
  .gain("<0 .1 .15 .2>")

$: n("<c4 eb4 g4 bb4>").scale("c:minor").s("sawtooth")
  .lpf(1800).release(.3).room(.3).gain(.35)
