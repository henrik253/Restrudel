setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain(.18)

$: n("0 3 7 5").scale("c:minor").s("sawtooth")
  .lpf(1829).release(.2).room(.3).delay(.4)
  .delaytime(.08).delayfeedback(.4).gain(.4)

$: note("c2 g1 c2 f1").s("gm_electric_guitar_jazz")
  .lpf(700).release(.3).gain(.4)
