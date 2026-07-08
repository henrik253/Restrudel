setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ mt ~ mt*2").gain(.3)

$: note("a4 a3 c4 f4 c4 e4").s("square").lpf(3090)
  .release(.15).gain(.4)

$: note("b4 a4 b4 c5").s("supersaw").lpf(2000)
  .room(.5).release(.2).gain(.35)
