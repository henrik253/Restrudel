setcpm(100)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("vocal 1").clip(1).note("c4 c#4 d#4 f4 d#4 g#3@8 ~ d#4 f4@2 d#4@2 d4 d#4@4").lpf(1500).gain(.4)

$: s("hh cp").slow(8).gain(.2)

$: note("b4 c5 e5 c5 b4 a4 b4 c5 e5 c5 b4 a4 b4 c5 e5 c5 b4").lpf(1500).gain(.4)

$: s("gm_oboe tambourine*2").cutoff(1000).resonance(2).gain(.5)
