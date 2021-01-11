import { Image, Text } from 'components/shared'
import { classNames } from 'utils/classNames'

export default function ACPLocations({ shouldShowPhoneNumber = false }) {
  const locations = {
    'Central Area': [
      { name: 'Alexandra Hospital', phone: '6370 6029' },
      { name: "KK Women's and Children's Hospital", phone: '9060 0375' },
      { name: 'National Heart Centre of Singapore', phone: '8299 3548' },
      { name: 'Singapore General Hospital', phone: '6576 2152' },
      { name: 'Tan Tock Seng Hospital', phone: '6359 6410 / 6359 6411' },
      { name: 'Outram Polyclinic', phone: '6643 6969' },
      { name: 'Toa Payoh Polyclinic', phone: '6355 3000' },
      { name: '@ 27 Family Service Centre', phone: '6270 8327' },
      { name: 'GoodLife! @ Telok Blangah', phone: '6274 6904' },
      { name: 'Family Central (Tiong Bahru)', phone: '6593 6456' },
      {
        name: 'Fei Yue Senior Activity Centre (Holland Close)',
        phone: '6774 4044',
      },
      {
        name: 'Fei Yue Senior Activity Centre (Commonwealth)',
        phone: '6471 2022',
      },
      { name: 'Brahm Centre @ Novena', phone: '6258 0831' },
      { name: 'GoodLife! @ Kreta Ayer', phone: '6904 9285' },
      { name: 'Kreta Ayer Family Services', phone: '6325 4753' },
      { name: 'Life Point @ Chinatown Point', phone: '6538 9877' },
      {
        name: 'SATA CommHealth - Potong Pasir Medical Centre',
        phone: '6244 6688',
      },
      { name: 'GoodLife! @ Central', phone: '6926 0350' },
    ],
    'East Area': [
      { name: 'Changi General Hospital', phone: '6850 4567' },
      { name: 'Bedok Polyclinic', phone: '6643 6969' },
      { name: 'Geylang Polyclinic', phone: '6547 6456' },
      { name: 'C3 Family Clinic', phone: '6742 2285' },
      { name: 'Brahm Centre @ MacPherson', phone: '6741 1131' },
      { name: 'Brahm Centre @ Simei', phone: '6786 0800' },
      { name: 'Brahm Centre @ Tampines', phone: '67908 2122' },
      { name: 'GoodLife! @ Bedok', phone: '6312 3988' },
      { name: 'GoodLife! Makan', phone: '6702 0212' },
      { name: 'GoodLife! @ Marine Parade', phone: '6445 0570' },
      { name: 'Marine Parade Family Service Centre', phone: '6445 0100' },
      {
        name: 'SATA CommHealth - Uttamram Medical Centre (Bedok)',
        phone: '6244 6688',
      },
    ],
    'North East Area': [
      { name: 'Sengkang General Hospital', phone: '6930 2583' },
      { name: 'Hougang Polyclinic', phone: '6355 3000' },
      { name: 'Fei Yue @ Buangkok Green', phone: '6914 2166' },
      { name: 'Fei Yue @ Hougang Dewcourt', phone: '6202 4699' },
      { name: 'Fei Yue Senior Activity Centre (Hougang)', phone: '6538 0234' },
      { name: 'Hougang Sheng Hong Family Service Centre', phone: '6289 5022' },
      {
        name: 'SATA CommHealth - Ang Mo Kio Medical Centre',
        phone: '6244 6688',
      },
    ],
    'North Area': [
      { name: 'Khoo Teck Puat Hospital', phone: '6555 8000' },
      { name: 'Ang Mo Kio Polyclinic', phone: '6355 3000' },
      { name: 'Woodlands Polyclinic', phone: '6202 4699' },
      { name: 'Yishun Polyclinic', phone: '6355 3000' },
      { name: 'GoodLife! @ Yishun', phone: '6484 8040' },
      {
        name: 'SATA CommHealth - Woodlands Medical Centre',
        phone: '6244 6688',
      },
      { name: 'Wellness Kampung @ 765 Nee Soon Central', phone: '6257 4842' },
    ],
    'West Area': [
      { name: 'National University Hospital', phone: '6779 5555' },
      { name: 'Ng Teng Fong General Hospital', phone: '9622 5889' },
      { name: 'Bukit Batok Polyclinic', phone: '6355 3000' },
      { name: 'Choa Chu Kang Polyclinic', phone: '6355 3000' },
      { name: 'Jurong Polyclinic', phone: '6355 3000' },
      { name: 'Pioneer Polyclinic', phone: '6355 3000' },
      { name: 'Queenstown Polyclinic', phone: '6355 3000' },
      { name: 'Choa Chu Kang Fei Yue Retirees Centre', phone: '6769 6981' },
      { name: 'Fei Yue @ Limbang Green', phone: '6661 9499' },
      {
        name: 'Fei Yue Senior Activity Centre @ 183 Bukit Batok Ave 8',
        phone: '6561 4404',
      },
      {
        name: 'Fei Yue Senior Activity Centre @ 210A Bukit Batok St 21',
        phone: '6563 3662',
      },
      { name: 'Fei Yue Senior Activity Centre (Limbang)', phone: '6659 0616' },
      { name: 'Fei Yue Senior Activity Centre (Senja)', phone: '6351 9555' },
      {
        name: 'Fei Yue Senior Activity Centre @ 9 Teck Whye Lane',
        phone: '6893 6606',
      },
      {
        name: 'Fei Yue Senior Activity Centre @ 165A Teck Whye',
        phone: '6380 9155',
      },
      { name: 'Fei Yue @ Sunshine Court', phone: '6334 0180' },
      { name: 'SATA CommHealth - Jurong Medical Centre', phone: '6244 6688' },
    ],
  }

  return (
    <div>
      <div className='AspectRatio _16-9'>
        <Image alt='' src='/assets/gifs/spokesperson-light.webp' />
      </div>
      <br />
      <Text className='color-dark text-center' element='p'>
        Your wishes and beliefs can easily be officialised in your ACP at the
        following healthcare institutions:
      </Text>
      <br />
      {Object.entries(locations).map(([area, locations]) => (
        <details key={area} className='ACPLcations mb-24'>
          <summary
            className='flex justify-between background-light rounded-8 items-center px-24'
            style={{ height: '3rem' }}
          >
            <Text as='h6' className='color-dark fw-700' element='h3'>
              {area}
            </Text>
          </summary>
          <ul className='px-24 pt-16'>
            {locations.map(({ name, phone }) => (
              <li
                key={name}
                className={classNames(shouldShowPhoneNumber && 'mb-8')}
              >
                <Text className='color-dark' element='p'>
                  {shouldShowPhoneNumber ? (
                    <>
                      <strong>{name}</strong>
                      <br />
                      <a
                        className='color-dark underline'
                        href={`tel:+65 ${phone}`}
                      >
                        {phone}
                      </a>
                    </>
                  ) : (
                    name
                  )}
                </Text>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  )
}
