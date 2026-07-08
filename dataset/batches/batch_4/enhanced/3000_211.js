setcpm(100)

$: sound("sine bd*2").lpf(2632).resonance(2).room(.8).bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.2)

$: note("g5 d5 e5 c5").cutoff(933).resonance(13).gain(.3).lpf(1500).gain(.4)
