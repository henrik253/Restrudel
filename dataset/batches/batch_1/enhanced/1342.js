setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*4").hpf(3000).room(.3).delay(.2).delaytime(.125).gain(.2)

$: n("c2 f2 g2 f2 ~ -6 -5 -7@3 ~ 0 1 2 3 -4 -3 -2 -1").scale("c:minor").s("gm_epiano1")
  .lpf(2200).release(.25).pan(.55).gain(.35)

$: note("g4 ~ c5 ~ e5 ~ c5 ~").s("sawtooth")
  .lpf(2000).room(.4).delay(.4).release(.2).gain(.35)
