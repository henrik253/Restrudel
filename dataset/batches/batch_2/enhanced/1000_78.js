setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.2)

$: n("<0 2 3>").scale("c:major").s("gm_lead_8_bass_lead").lpf(2000).release(.15).gain(.4)

$: note("c5 e5 f4").s("bell").gain(.3).release(.2)
