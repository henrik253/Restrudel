setcpm(122/4)

$: s("bd ~ bd ~").bank("RolandTR808").gain(.85)

$: s("hh*16").delay("<0 .5>").lpf(3000).room(.5).gain("[.22 .13]*8")

$: s("~ sleighbells ~ rd").gain(.35).room(.6).lpf(2573).pan(.6)

$: n("c1 ~ eb1 ~ g1 ~ c1 ~").scale("c:minor").s("sawtooth")
  .lpf(700).release(.2).gain(.5)

$: n("<c3 g2 eb3 bb2>").scale("c:minor").s("square")
  .lpf(1800).release(.15).delay(.4).gain(.32)
