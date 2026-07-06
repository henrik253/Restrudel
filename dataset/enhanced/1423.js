setcpm(116/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("mt*2 lt*2").gain(.4).pan(.4)

$: n("0 3 7 5").scale("d:minor").s("gm_baritone_sax")
  .lpf(2000).release(.2).room(.3).gain(.4)

$: note("d#5 d5 c#5 d5").sound("sawtooth").lpf(1000)
  .resonance(13).release(.2).gain(.4)

$: n("<d2 d2 a1 bb1>").scale("d:minor").s("sawtooth")
  .lpf(600).release(.2).gain(.5)
