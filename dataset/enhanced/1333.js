setcpm(118/4)

$: s("bd:1 ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain("[.2 .12]*4")

$: n("0 3 7 5").scale("c:minor").s("gm_epiano1")
  .lpf(2600).release(.3).room(.3).gain(.35)

$: note("c1 ~ f1 g1").s("supersaw")
  .lpf(700).room(.4).gain(.6).release(.4)
