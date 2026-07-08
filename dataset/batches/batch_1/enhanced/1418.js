setcpm(120/4)

$: s("bd*2 ~ ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain(.2).pan(.4)

$: note("a2*4 c3 a2 e2 a2").transpose(3).s("gm_electric_bass_pick")
  .lpf(700).release(.2).gain(.5)

$: n("0 3 7 5 3 0 5 7").scale("a:minor").s("gm_electric_guitar_jazz")
  .lpf(2000).release(.2).room(.3).gain(.4)
