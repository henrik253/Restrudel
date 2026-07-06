setcpm(96/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("rd ~ rd ~").gain(.25)

$: n("0 2 4 ~").scale("g:minor").s("gm_electric_guitar_clean")
  .lpf(2000).release(.3).room(.4).gain(.35)

$: note("g2 d2 g2 f2").s("sawtooth").lpf(700)
  .release(.25).gain(.45)
