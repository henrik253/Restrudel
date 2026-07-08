setcpm(97/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.75)

$: s("~ hh ~ hh").gain(.2)

$: n("0 2 5 2").scale("e:phrygian").s("sawtooth").lpf(900).gain(.45)

$: n("0 3 2 4 3 5 4 0").scale("e:phrygian").s("square").lpf(2200).resonance(.6).gain(.4)

