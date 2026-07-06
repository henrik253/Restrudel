setcpm(104/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ hh ~ hh").gain(.2)

$: note("d5 c#5@6 ~ a4 c#5@6 ~ a4").s("sawtooth")
  .lpf(656).release(.2).delay(.3).gain(.4)

$: n("<a1 e2 f#1 g1>").scale("a:minor").s("gm_drawbar_organ")
  .lpf(700).release(.25).gain(.45)
