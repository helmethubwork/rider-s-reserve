import waterproofBootsImg from "@/assets/blog/waterproof-boots.jpg";
import motorcycleGlovesImg from "@/assets/blog/motorcycle-gloves.jpg";
import helmetCertificationsImg from "@/assets/blog/helmet-certifications.jpg";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "waterproof-motorcycle-boots-why-they-still-get-wet",
    title: "Waterproof Motorcycle Boots: Why They Still Get Wet",
    excerpt: "Modern motorcycle boots use some impressive waterproofing technology and yet, after a ride in heavy rain, your socks feel damp. Is the waterproofing failing?",
    content: `Modern motorcycle boots use some impressive waterproofing technology and yet, after a ride in heavy rain, your socks feel damp. Is the waterproofing failing?

The truth is, most waterproof boots work exactly as designed. The membrane keeps external water out, but the issue often lies elsewhere. Here's what's really happening:

**1. Sweat Accumulation**
Your feet naturally produce sweat, especially during long rides. Waterproof membranes are designed to be breathable, but in humid conditions or during intense riding, moisture from perspiration can accumulate faster than it can escape.

**2. Water Entry Points**
Water can enter through the boot opening at the top, especially if your riding pants don't overlap properly. Rain runs down your legs and seeps into the boot from above.

**3. Membrane Saturation**
Over time, waterproof membranes can become saturated or damaged, reducing their effectiveness. Regular maintenance and proper care are essential.

**Tips to Stay Dry:**
- Wear waterproof over-pants that overlap your boots
- Use boot covers for heavy rain
- Apply waterproofing treatment regularly
- Allow boots to dry completely between rides
- Invest in quality waterproof socks as an extra layer`,
    image: waterproofBootsImg,
    date: "Aug 26, 2025",
    author: "Helmet Hub Team",
    category: "Gear Tips"
  },
  {
    id: "2",
    slug: "are-motorcycle-gloves-optional-even-in-the-city",
    title: "Are Motorcycle Gloves Optional - Even in the City?",
    excerpt: "When it comes to riding gear, helmets may steal the spotlight—but motorcycle gloves are just as essential, especially in city traffic. From preventing injuries in low-speed spills to enhancing grip and comfort, the right gloves make a world of difference.",
    content: `When it comes to riding gear, helmets may steal the spotlight—but motorcycle gloves are just as essential, especially in city traffic. From preventing injuries in low-speed spills to enhancing grip and comfort, the right gloves make a world of difference. Whether you're a daily commuter or a weekend rider, find out why gloves should never be optional.

**The Instinctive Response**
When we fall, our natural instinct is to extend our hands to break the fall. Without proper protection, this can lead to severe abrasions, fractures, or permanent damage to your hands.

**City Riding Risks**
Many riders think city speeds are "safe" speeds. However, studies show that most motorcycle accidents happen at speeds below 50 km/h. A simple low-speed fall can cause significant hand injuries.

**Benefits of Wearing Gloves:**

*Protection*
- Abrasion resistance in case of a slide
- Knuckle and palm armor for impact protection
- Protection from flying debris

*Comfort*
- Better grip in all weather conditions
- Reduced vibration fatigue
- Protection from sun, wind, and cold

*Control*
- Enhanced feel and feedback from controls
- Better throttle and brake control
- Reduced hand fatigue on long rides

**Choosing the Right Gloves:**
- Summer gloves for hot weather with ventilation
- Winter gloves with insulation and waterproofing
- Short cuff for urban riding convenience
- CE certification for guaranteed protection`,
    image: motorcycleGlovesImg,
    date: "Aug 05, 2025",
    author: "Helmet Hub Team",
    category: "Safety"
  },
  {
    id: "3",
    slug: "helmet-certifications-explained",
    title: "Helmet Certifications Explained",
    excerpt: "Choosing the right helmet isn't just about style—it's about safety. With certifications like ISI, ECE, FIM, and SHARP printed on your helmet, understanding what they mean can be the difference between basic protection and race-grade safety.",
    content: `Choosing the right helmet isn't just about style—it's about safety. With certifications like ISI, ECE, FIM, and SHARP printed on your helmet, understanding what they mean can be the difference between basic protection and race-grade safety. This guide breaks down each standard, explains what to look for, and helps you make an informed choice before your next ride.

**ISI (Indian Standards Institute)**
- Mandatory certification for helmets sold in India
- Basic safety requirements for the Indian market
- Tests include impact absorption and penetration resistance
- Minimum standard required by law

**ECE 22.05 / ECE 22.06**
- European safety standard, globally recognized
- ECE 22.06 is the latest version with stricter testing
- Tests at multiple impact points
- Includes rotational impact testing (22.06)
- Widely accepted for track use

**DOT (Department of Transportation)**
- US safety standard
- Self-certification by manufacturers
- Random testing by NHTSA
- Common in American-made helmets

**SHARP (Safety Helmet Assessment and Rating Programme)**
- UK-based independent testing program
- 1 to 5-star rating system
- Tests helmets beyond certification requirements
- Provides detailed safety comparisons

**FIM (Fédération Internationale de Motocyclisme)**
- Highest level racing certification
- Required for MotoGP and World Superbike
- FIM Racing Homologation Programme (FRHP)
- Exceeds all other standards

**What to Look For:**
- At minimum, look for ISI + ECE certification
- For track use, ensure ECE 22.06 compliance
- Check SHARP ratings for independent verification
- For racing, FIM homologation is essential

**Remember:** A certified helmet is only effective if it fits properly. Always try before you buy!`,
    image: helmetCertificationsImg,
    date: "Aug 01, 2025",
    author: "Helmet Hub Team",
    category: "Education"
  }
];
