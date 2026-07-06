setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("pulse*4").gain(.2).pan(.5)

$: note("c1 f1 g1 c1").s("sawtooth").lpf(800)
  .release(.2).gain(.45)

$: n("0 3 7 5").scale("c:major").s("square")
  .lpf(1500).release(.2).gain(.4)
