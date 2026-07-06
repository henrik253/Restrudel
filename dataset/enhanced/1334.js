setcpm(115/4)

$: s("bd*2 ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*4").gain(.2)

$: n("0 3 5 7").scale("b:minor").s("gm_piano")
  .lpf(2600).release(.4).room(.3).gain(.35)

$: note("b2 d2").s("gm_tuba")
  .lpf(500).release(.3).gain(.4)
