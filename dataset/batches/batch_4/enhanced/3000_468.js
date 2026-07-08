setcpm(110/4)

$: s("gm_baritone_sax bd:3 gm_electric_bass_pick").gain(.75).room(.2)

$: s("hh*8").gain(.2).room(.3)

$: n("~ 4 4@2 ~").scale("G0:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("3 4 -3 -2").scale("G0:minor").transpose(12).s("square").lpf(1800).resonance(4).gain(.4).release(.2)

$: n("0").scale("G0:minor").s("sine").lpf(1200).room(.6).gain(.12).release(.4)

