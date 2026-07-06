setcpm(128/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("~ sd ~ sd").gain(.75)

$: note("~ a1 ~ e2").s("gm_acoustic_bass")
  .lpf(500).release(.3).gain(.55)

$: n("0 3 7 5").scale("a:minor").s("gm_flute")
  .clip(1).lpf(2800).release(.3).gain(.35)
