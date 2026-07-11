setcpm(120/4)

$: s("amen*2").bank("RolandTR909").lpf(3500).gain(.7)

$: s("hh*4").gain(.2)

$: n("6 5 4").scale("d:hirajoshi").s("gm_baritone_sax")
  .lpf(2000).room(.5).release(.2).gain(.4)

$: n("<d2 d2 a1 c2>").scale("d:hirajoshi").s("sawtooth")
  .lpf(600).release(.25).gain(.5)
