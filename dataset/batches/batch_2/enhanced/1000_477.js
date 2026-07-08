setcpm(110/4)
$: s("hh ~ hh ~").lpf(2500).room(.2).gain(.3)
$: note("c2*8 c3 d#3@2 c#3").segment(16).s("sawtooth").gain(.4)
$: s("bd ~ ~ ~").gain(.8)
