setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.18)

$: n("0 7 5 3 0 7 5 3").scale("c#4:minor").s("square").room(.6).release(.15).gain(.4)

$: note("<D2 C#2 F#2 B2>").s("sawtooth").lpf(600).release(.3).gain(.5)
