setcpm(144/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.75)

$: s("~ hh ~ hh").gain(.2)

$: n("0 3 5 3").scale("d:phrygian").s("sawtooth").lpf(900).gain(.45)

$: n("0 3 2 4 3 5 4 0").scale("d:phrygian").s("square").lpf(2200).resonance(.6).gain(.4)

