setcpm(122/4)

$: s("bd ~ sd ~").bank("Linn9000").gain(.85)

$: s("hh*16").lpf(3500).gain(.15).pan(.4)

$: n("0 3 7 5").scale("a:minor").s("gm_drawbar_organ")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: note("a4 e4 c4 a3").sound("supersaw").lpf(2500)
  .release(.2).room(.5).gain(.4)

$: n("<a1 a1 e1 f1>").scale("a:minor").s("gm_electric_bass_finger")
  .lpf(700).release(.2).gain(.5)
