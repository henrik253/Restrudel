setcpm(110/4)

$: s("clave").gain(.75).room(.2)

$: n("G3 C3 E3 F2 D2 G2 C2 F2 D2 G2 ").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("~ g#3 g#3 g3").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)

$: n("0").scale("c2:minor").s("sine").lpf(1200).room(.6).gain(.12).release(.4)
