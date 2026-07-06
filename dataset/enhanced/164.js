setcpm(124/4)

$: s("bd*2 ~ bd ~").bank("RolandTR909").lpf(2856).gain("0.6 0.5 0.7 0.6")

$: s("hh*8").gain(.16)

$: note("~ a2 ~ ~").s("sawtooth")
  .lpf(2000).release(.2).gain(.4)

$: n("<0 3 5 7>").scale("a:minor").s("gm_church_organ")
  .room(.5).release(.4).gain(.3)

$: n("<a1 e2 f1 g1>").scale("a:minor").s("square")
  .lpf(600).release(.25).gain(.5)
