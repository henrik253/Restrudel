setcpm(100/4)

$: s("triangle bd:1").struct("[~ x]*2").scale("c2:minor").gain(0.3)

$: n("c2 f2 g2 f2 ~ Ab3 C4 Eb4 Ab3").lpf(2800).gain("[1 0.5]*4").room(.317).release(.0919)

$: s("bd*2 ~").gain(0.5)
