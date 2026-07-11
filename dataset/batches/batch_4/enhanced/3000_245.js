setcpm(100)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: note("D2 G2 D2 C#2 F#2").lpf(1500).gain(.4)

$: n("0 7 4 2 7 4 b 3 1 2 1 0 4 5 2 4 0").lpf(1500).gain(.4)

$: note("c2 g2 a2 f2 c3 g2 d#2 f2@3 ~ 3 72 gb2*2 gb2@1.4 ab2 bb2 gb2 a1*2 g1 ~ c#2 ~ f#2 ~ d4 d4@2 ~ c4 c4 a4@3 ~ c3 f3@2").sound("square sd").lpf("<[10 10 100]>").resonance(10).gain(.8)
