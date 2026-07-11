setcpm(128/4)

$: s("bd*2 sd").bank("RolandTR909").gain(.85)

$: s("hh*16").attack(.005).release(.05).gain("[.2 .12]*8")

$: s("~ sleighbells ~ sleighbells").room(.6).gain(.3)

$: n("0 3 5 7 5 3").scale("d:minor").s("sawtooth")
  .lpf(2400).resonance(6).release(.2).gain(.4)

$: n("<d2 a1 bb1 f1>").scale("d:minor").s("square")
  .lpf(700).release(.25).gain(.5)
