setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.35)

$: s("~ rim ~ rim").gain(.25).room(.3)

$: n("9 9 6 7 11 11 6 7 11 12 13 14").scale("d:minor:pentatonic").s("sawtooth").lpf(2400).resonance(6).release(.15).room(.4).gain(.4)

$: n("<d2 a1 f1 c2>").scale("d:minor:pentatonic").s("square").lpf(600).release(.3).gain(.5)
