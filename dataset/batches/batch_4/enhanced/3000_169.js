setcpm(110/4)

$: n("d2*8 c#2@11 e2 f#2@3").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("d2*8 c#2@11 e2 f#2@3").scale("c2:minor").transpose(12).s("square").lpf(1800).gain(.35).release(.2)

$: n("0").scale("c2:minor").s("sine").lpf(1200).room(.6).gain(.12).release(.4)
