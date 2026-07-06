setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ hh ~ hh").gain(.2).pan(.4)

$: note("c4 e4 g4 e4").s("gm_oboe").lpf(2000)
  .release(.2).room(.4).gain(.4)

$: n("c2 f2 c2 g2").scale("c:major").s("gm_overdriven_guitar")
  .lpf(700).release(.2).gain(.4)
